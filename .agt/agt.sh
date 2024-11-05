#!/bin/bash

# 현재 디렉토리가 git 저장소인지 확인하는 함수
check_git_repo() {
    if [ ! -d .git ]; then
        echo "Error: Not a git repository. Please run 'git init' first."
        exit 1
    fi
}

# GitHub CLI가 설치되어 있는지 확인하는 함수
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo "Error: GitHub CLI is not installed. Please install it first."
        exit 1
    fi
}

# 도움말 출력 함수
print_help() {
    echo "AGT - Automatic Git & Github Tool"
    echo
    echo "Usage: agt <command>"
    echo
    echo "Available Commands:"
    echo "  list     List all open issues in current repository, sorted by issue number"
    echo "  branch   Create and switch to a new feature branch based on issue number"
    echo "           Format: feature-{fe|be}-#{issue-number}"
    echo "  pr       Create a pull request from current feature branch"
    echo
    echo "Command Details:"
    echo "  list:"
    echo "    - Shows all open issues in the current repository"
    echo "    - Issues are sorted by number"
    echo "    - No additional arguments required"
    echo
    echo "  branch:"
    echo "    - Shows list of open issues and prompts for issue number"
    echo "    - Creates a new branch from dev-fe or dev-be based on issue prefix"
    echo "    - Automatically switches to the new branch"
    echo "    - Branch naming convention: feature-fe-#1 or feature-be-#1"
    echo
    echo "  pr:"
    echo "    - Creates a pull request from current feature branch"
    echo "    - PR title will match the issue title"
    echo "    - Adds reviewers from CODEOWNERS automatically"
    echo "    - Uses pull request template from .github/pull_request_template.md"
    echo "    - Automatically links PR with issue for auto-close on merge"
    echo
    echo "Examples:"
    echo "  agt list"
    echo "  agt branch"
    echo "  agt pr"
}

# 이슈 목록 출력 함수
list_issues() {
    check_git_repo
    check_gh_cli
    echo "=== Open Issues ==="
    
    # JSON 형식으로 이슈를 가져와서 정렬 후 출력
    gh issue list --json number,title -q '.[] | [.number, .title] | @tsv' | 
    sort -n | 
    while IFS=$'\t' read -r number title; do
        printf "#%-3d %s\n" "$number" "$title"
    done
}

# 브랜치 생성 함수
create_branch() {
    check_git_repo
    check_gh_cli
    
    # 이슈 목록 출력
    list_issues
    
    # 이슈 번호 입력 받기
    echo -n "Select issue number: "
    read issue_number
    
    # 이슈 정보 가져오기
    issue_title=$(gh issue view $issue_number --json title -q .title)
    
    if [ $? -ne 0 ]; then
        echo "Error: Failed to fetch issue information. Please check the issue number."
        exit 1
    fi
    
    # 이슈 제목에서 FE/BE 구분 추출
    if [[ $issue_title =~ \[FE\] ]]; then
        type="fe"
        source_branch="dev-fe"
    elif [[ $issue_title =~ \[BE\] ]]; then
        type="be"
        source_branch="dev-be"
    else
        echo "Error: Issue title must start with [FE] or [BE]"
        exit 1
    fi
    
    # 브랜치 이름 생성
    branch_name="feature-$type-#$issue_number"
    
    # source 브랜치 존재 여부 확인
    if ! git rev-parse --verify $source_branch &> /dev/null; then
        echo "Error: Source branch '$source_branch' does not exist"
        exit 1
    fi
    
    echo "Creating and switching to branch: $branch_name from $source_branch"
    
    # source 브랜치로 전환
    git checkout $source_branch
    
    # source 브랜치 최신화
    git pull origin $source_branch
    
    # 새 브랜치 생성 및 전환
    git checkout -b $branch_name
    
    echo "Successfully created and switched to branch: $branch_name"
}

# PR 생성 함수
create_pr() {
    check_git_repo
    check_gh_cli
    
    # 현재 브랜치 확인
    current_branch=$(git branch --show-current)
    
    # feature 브랜치가 아닌 경우 종료
    if [[ ! $current_branch =~ ^feature-(fe|be)-#[0-9]+$ ]]; then
        echo "Error: Current branch is not a feature branch"
        exit 1
    fi
    
    # 브랜치 정보에서 이슈 번호와 타입 추출
    issue_number=$(echo $current_branch | sed 's/.*#\([0-9]\+\)$/\1/')
    branch_type=$(echo $current_branch | sed 's/feature-\(fe\|be\).*/\1/')
    
    # 이슈 제목 가져오기
    issue_title=$(gh issue view $issue_number --json title -q .title)
    
    # base 브랜치 결정
    base_branch="dev-$branch_type"
    
    # CODEOWNERS 파일에서 리뷰어 목록 가져오기
    reviewers=$(gh api /repos/:owner/:repo/contents/.github/CODEOWNERS --jq '.content' | 
                base64 -d | 
                grep -v '^#' | 
                grep -o '@[[:alnum:]-]\+' | 
                tr '\n' ',' | 
                sed "s/@$(gh api /user --jq '.login'),//g" | 
                sed 's/,$//')
    
    # PR 템플릿 읽기 및 수정
    template_content=$(gh api /repos/:owner/:repo/contents/.github/pull_request_template.md --jq '.content' | base64 -d)
    
    # 이슈 번호 자동 추가
    pr_body=$(echo "$template_content" | sed "s/## #️⃣ 이슈 번호/## #️⃣ 이슈 번호\n#$issue_number/")
    
    # PR 생성
    echo "Creating PR with title: $issue_title"
    echo "Base branch: $base_branch"
    echo "Reviewers: $reviewers"
    
    # 변경사항 푸시
    git push origin $current_branch
    
    # PR 생성
    gh pr create \
        --title "$issue_title" \
        --body "$pr_body" \
        --base "$base_branch" \
        --reviewer "$reviewers"
    
    # PR과 이슈 연동
    gh pr edit --add-metadata "Closes #$issue_number"
    
    echo "Successfully created PR for issue #$issue_number"
}

# 메인 로직
case "$1" in
    "list")
        list_issues
        ;;
    "branch")
        create_branch
        ;;
    "pr")
        create_pr
        ;;
    *)
        print_help
        exit 1
        ;;
esac