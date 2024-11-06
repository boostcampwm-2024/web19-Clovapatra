# AGT - Automatic Git & Github Tool (PowerShell Version)

# 현재 디렉토리가 git 저장소인지 확인하는 함수
function Test-GitRepo {
    try {
        $null = git rev-parse --is-inside-work-tree 2>&1
        return $true
    }
    catch {
        Write-Host "Error: Not a git repository. Please run 'git init' first." -ForegroundColor Red
        return $false
    }
}

# GitHub CLI가 설치되어 있는지 확인하는 함수
function Test-GhCli {
    try {
        $null = Get-Command gh -ErrorAction Stop
        return $true
    }
    catch {
        Write-Host "Error: GitHub CLI is not installed. Please install it first." -ForegroundColor Red
        return $false
    }
}

# 도움말 출력 함수
function Show-Help {
    @"
AGT - Automatic Git & Github Tool

Usage: agt <command>

Available Commands:
  list     List all open issues in current repository, sorted by issue number
  branch   Create and switch to a new feature branch based on issue number
           Format: feature-{fe|be}-#{issue-number}
  pr       Create a pull request from current feature branch
  --help   Show this help message

Command Details:
  list:
    - Shows all open issues in the current repository
    - Issues are sorted by number
    - No additional arguments required

  branch:
    - Shows list of open issues and prompts for issue number
    - Creates a new branch from dev-fe or dev-be based on issue prefix
    - Automatically switches to the new branch
    - Branch naming convention: feature-fe-#1 or feature-be-#1

  pr:
    - Creates a pull request from current feature branch
    - PR title will match the issue title
    - Uses pull request template from .github/pull_request_template.md
    - Automatically links PR with issue for auto-close on merge

Examples:
  agt list
  agt branch
  agt pr
"@
}

# 이슈 목록 출력 함수
function Show-Issues {
    if (-not (Test-GitRepo)) { exit 1 }
    if (-not (Test-GhCli)) { exit 1 }

    Write-Host "=== Open Issues ===" -ForegroundColor Cyan

    $issues = gh issue list --json number,title | ConvertFrom-Json
    $sortedIssues = $issues | Sort-Object number

    foreach ($issue in $sortedIssues) {
        Write-Host ("#" + $issue.number.ToString().PadRight(3) + " " + $issue.title)
    }
}

# 브랜치 생성 함수
function New-Branch {
    if (-not (Test-GitRepo)) { exit 1 }
    if (-not (Test-GhCli)) { exit 1 }

    # 이슈 목록 출력
    Show-Issues

    # 이슈 번호 입력 받기
    $issueNumber = Read-Host "`nSelect issue number"

    # 이슈 정보 가져오기
    try {
        $issueTitle = gh issue view $issueNumber --json title | ConvertFrom-Json | Select-Object -ExpandProperty title
    }
    catch {
        Write-Host "Error: Failed to fetch issue information. Please check the issue number." -ForegroundColor Red
        exit 1
    }

    # 이슈 제목에서 FE/BE 구분 추출
    if ($issueTitle -match "\[FE\]") {
        $type = "fe"
        $sourceBranch = "dev-fe"
    }
    elseif ($issueTitle -match "\[BE\]") {
        $type = "be"
        $sourceBranch = "dev-be"
    }
    else {
        Write-Host "Error: Issue title must start with [FE] or [BE]" -ForegroundColor Red
        exit 1
    }

    # 브랜치 이름 생성
    $branchName = "feature-$type-#$issueNumber"

    # source 브랜치 존재 여부 확인
    try {
        $null = git rev-parse --verify $sourceBranch 2>&1
    }
    catch {
        Write-Host "Error: Source branch '$sourceBranch' does not exist" -ForegroundColor Red
        exit 1
    }

    # git 저장소 루트 디렉토리로 이동
    Set-Location (git rev-parse --show-toplevel)

    Write-Host "Creating and switching to branch: $branchName from $sourceBranch" -ForegroundColor Cyan

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
    if (-not (Test-GitRepo)) { exit 1 }
    if (-not (Test-GhCli)) { exit 1 }

    # 현재 브랜치 확인
    $currentBranch = git branch --show-current

    # feature 브랜치가 아닌 경우 종료
    if ($currentBranch -notmatch "^feature-(fe|be)-#\d+$") {
        Write-Host "Error: Current branch is not a feature branch" -ForegroundColor Red
        exit 1
    }

    # 브랜치 정보에서 이슈 번호와 타입 추출
    if ($currentBranch -match "feature-(fe|be)-#(\d+)$") {
        $branchType = $matches[1]
        $issueNumber = $matches[2]
    }
    else {
        Write-Host "Error: Invalid branch name format" -ForegroundColor Red
        exit 1
    }

    # 이슈 정보 가져오기
    try {
        $issueTitle = gh issue view $issueNumber --json title | ConvertFrom-Json | Select-Object -ExpandProperty title
    }
    catch {
        Write-Host "Error: Failed to fetch issue information. Please check the issue number." -ForegroundColor Red
        exit 1
    }

    # base 브랜치 결정
    $baseBranch = "dev-$branchType"

    # PR 템플릿 읽기 및 수정
    $templateContent = gh api "/repos/:owner/:repo/contents/.github/pull_request_template.md" | 
                      ConvertFrom-Json | 
                      Select-Object -ExpandProperty content | 
                      [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_))

    # 이슈 번호 자동 추가
    $prBody = $templateContent -replace "## #️⃣ 이슈 번호", "## #️⃣ 이슈 번호`n#$issueNumber"

    # 현재 사용자의 GitHub 사용자명 가져오기
    $currentUser = gh api user | ConvertFrom-Json | Select-Object -ExpandProperty login

    # PR 생성 정보 출력
    Write-Host "Creating PR with title: $issueTitle" -ForegroundColor Cyan
    Write-Host "Base branch: $baseBranch" -ForegroundColor Cyan

    # 변경사항 푸시
    git push origin $currentBranch

    # CODEOWNERS 파일에서 리뷰어 목록 가져오기
    $codeownersContent = gh api "/repos/:owner/:repo/contents/.github/CODEOWNERS" | 
                        ConvertFrom-Json | 
                        Select-Object -ExpandProperty content | 
                        [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_))

    $reviewers = $codeownersContent -split "`n" | 
                ForEach-Object { [regex]::Matches($_, '@(\w+)').Groups[1].Value } | 
                Where-Object { $_ -and $_ -ne $currentUser } | 
                Join-String -Separator ","

    # PR 생성
    try {
        $prUrl = gh pr create --title $issueTitle --body $prBody --base $baseBranch --reviewer $reviewers --assignee $currentUser
        
        if ($prUrl -match "/pull/(\d+)$") {
            $prNumber = $matches[1]
            Write-Host "Successfully created PR #$prNumber" -ForegroundColor Green
            Write-Host "PR URL: $prUrl" -ForegroundColor Green
        }
        else {
            Write-Host "PR created successfully, but couldn't extract PR number" -ForegroundColor Yellow
            Write-Host "PR URL: $prUrl" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "Error: Failed to create PR" -ForegroundColor Red
        exit 1
    }
}

# 메인 로직
$command = $args[0]

switch ($command) {
    "list" { Show-Issues }
    "branch" { New-Branch }
    "pr" { New-PullRequest }
    "--help" { Show-Help }
    default { 
        if ($command) {
            Write-Host "Error: Unknown command '$command'" -ForegroundColor Red
            Write-Host "Run 'agt --help' for usage information" -ForegroundColor Yellow
        } else {
            Show-Help
        }
        exit 1
    }
}