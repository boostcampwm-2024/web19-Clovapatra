# AGT (Automatic Git & Github Tool) PowerShell Script

# 현재 디렉토리가 git 저장소인지 확인하는 함수
function Test-GitRepo {
    try {
        git rev-parse --is-inside-work-tree | Out-Null
        return $true
    } catch {
        Write-Host "Error: Not a git repository. Please run 'git init' first." -ForegroundColor Red
        exit 1
    }
}

# GitHub CLI가 설치되어 있는지 확인하는 함수
function Test-GhCli {
    try {
        Get-Command gh -ErrorAction Stop | Out-Null
        return $true
    } catch {
        Write-Host "Error: GitHub CLI is not installed. Please install it first." -ForegroundColor Red
        exit 1
    }
}

# 도움말 출력 함수
function Show-Help {
    Write-Host "AGT - Automatic Git & Github Tool"
    Write-Host ""
    Write-Host "Usage: agt <command>"
    Write-Host ""
    Write-Host "Available Commands:"
    Write-Host "  list     List all open issues in current repository, sorted by issue number"
    Write-Host "  branch   Create and switch to a new feature branch based on issue number"
    Write-Host "           Format: feature-{fe|be}-#{issue-number}"
    Write-Host "  pr       Create a pull request from current feature branch"
    Write-Host ""
    Write-Host "Command Details:"
    Write-Host "  list:"
    Write-Host "    - Shows all open issues in the current repository"
    Write-Host "    - Issues are sorted by number"
    Write-Host "    - No additional arguments required"
    Write-Host ""
    Write-Host "  branch:"
    Write-Host "    - Shows list of open issues and prompts for issue number"
    Write-Host "    - Creates a new branch from dev-fe or dev-be based on issue prefix"
    Write-Host "    - Automatically switches to the new branch"
    Write-Host "    - Branch naming convention: feature-fe-#1 or feature-be-#1"
    Write-Host ""
    Write-Host "  pr:"
    Write-Host "    - Creates a pull request from current feature branch"
    Write-Host "    - PR title will match the issue title"
    Write-Host "    - Uses pull request template from .github/pull_request_template.md"
    Write-Host "    - Automatically links PR with issue for auto-close on merge"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  agt list"
    Write-Host "  agt branch"
    Write-Host "  agt pr"
}

# 이슈 목록 출력 함수
function Show-Issues {
    Test-GitRepo
    Test-GhCli
    
    Write-Host "=== Open Issues ===" -ForegroundColor Blue

    $issues = gh issue list --json number,title -q '.[] | [.number, .title] | @tsv' | 
              ConvertFrom-Csv -Delimiter "`t" -Header "Number", "Title" | 
              Sort-Object { [int]$_.Number }

    foreach ($issue in $issues) {
        Write-Host ("#" + $issue.Number.PadRight(3) + " " + $issue.Title)
    }
}

# 브랜치 생성 함수
function New-Branch {
    Test-GitRepo
    Test-GhCli

    # 이슈 목록 출력
    Show-Issues

    # 이슈 번호 입력 받기
    $issueNumber = Read-Host -Prompt "Select issue number"

    # 이슈 정보 가져오기
    try {
        $issueTitle = gh issue view $issueNumber --json title -q .title
    } catch {
        Write-Host "Error: Failed to fetch issue information. Please check the issue number." -ForegroundColor Red
        exit 1
    }

    # 이슈 제목에서 FE/BE 구분 추출
    if ($issueTitle -match '\[FE\]') {
        $type = "fe"
        $sourceBranch = "dev-fe"
    } elseif ($issueTitle -match '\[BE\]') {
        $type = "be"
        $sourceBranch = "dev-be"
    } else {
        Write-Host "Error: Issue title must start with [FE] or [BE]" -ForegroundColor Red
        exit 1
    }

    # 브랜치 이름 생성
    $branchName = "feature-$type-#$issueNumber"

    # source 브랜치 존재 여부 확인
    try {
        git rev-parse --verify $sourceBranch | Out-Null
    } catch {
        Write-Host "Error: Source branch '$sourceBranch' does not exist" -ForegroundColor Red
        exit 1
    }

    Write-Host "Creating and switching to branch: $branchName from $sourceBranch"

    # source 브랜치로 전환
    git checkout $sourceBranch

    # source 브랜치 최신화
    git pull origin $sourceBranch

    # 새 브랜치 생성 및 전환
    git checkout -b $branchName

    Write-Host "Successfully created and switched to branch: $branchName" -ForegroundColor Green
}

# PR 생성 함수
function New-PullRequest {
    Test-GitRepo
    Test-GhCli

    # 현재 브랜치 확인
    $currentBranch = git branch --show-current

    # feature 브랜치가 아닌 경우 종료
    if ($currentBranch -notmatch '^feature-(fe|be)-#[0-9]+$') {
        Write-Host "Error: Current branch is not a feature branch" -ForegroundColor Red
        exit 1
    }

    # 브랜치 정보에서 이슈 번호와 타입 추출
    if ($currentBranch -match 'feature-(fe|be)-#([0-9]+)$') {
        $branchType = $matches[1]
        $issueNumber = $matches[2]
    } else {
        Write-Host "Error: Invalid branch name format" -ForegroundColor Red
        exit 1
    }

    # 이슈 정보 가져오기
    try {
        $issueTitle = gh issue view $issueNumber --json title -q .title
    } catch {
        Write-Host "Error: Failed to fetch issue information. Please check the issue number." -ForegroundColor Red
        exit 1
    }

    # base 브랜치 결정
    $baseBranch = "dev-$branchType"

    # PR 템플릿 읽기 및 수정
    $templateContent = gh api /repos/:owner/:repo/contents/.github/pull_request_template.md -q .content | 
                      [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_))

    # 이슈 번호 자동 추가
    $prBody = $templateContent -replace "## #️⃣ 이슈 번호", "## #️⃣ 이슈 번호`n#$issueNumber"

    # 현재 사용자의 GitHub 사용자명 가져오기
    $currentUser = gh api user -q .login

    # PR 생성 정보 출력
    Write-Host "Creating PR with title: $issueTitle"
    Write-Host "Base branch: $baseBranch"

    # 변경사항 푸시
    git push origin $currentBranch

    # CODEOWNERS 파일에서 리뷰어 목록 가져오기 (@ 제거, 현재 사용자 제외)
    $reviewers = gh api /repos/:owner/:repo/contents/.github/CODEOWNERS -q .content |
                 ForEach-Object { [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_)) } |
                 Select-String -Pattern '@[a-zA-Z0-9_-]+' -AllMatches |
                 ForEach-Object { $_.Matches } |
                 ForEach-Object { $_.Value.TrimStart('@') } |
                 Where-Object { $_ -ne $currentUser } |
                 Join-String -Separator ","

    # PR 생성
    try {
        $prUrl = gh pr create --title $issueTitle --body $prBody --base $baseBranch --reviewer $reviewers --assignee $currentUser
        
        if ($prUrl -match '/pull/([0-9]+)$') {
            $prNumber = $matches[1]
            Write-Host "Successfully created PR #$prNumber" -ForegroundColor Green
            Write-Host "PR URL: $prUrl"
        } else {
            Write-Host "PR created successfully, but couldn't extract PR number" -ForegroundColor Yellow
            Write-Host "PR URL: $prUrl"
        }
    } catch {
        Write-Host "Error: Failed to create PR" -ForegroundColor Red
        exit 1
    }
}

# 메인 로직
param(
    [Parameter(Position=0)]
    [string]$Command
)

switch ($Command) {
    "list" { Show-Issues }
    "branch" { New-Branch }
    "pr" { New-PullRequest }
    default { Show-Help }
}