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

# 브랜치 생성 함수는 이전과 동일...
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

# 메인 로직
case "$1" in
    "list")
        list_issues
        ;;
    "branch")
        create_branch
        ;;
    *)
        echo "Usage: agt {list|branch}"
        exit 1
        ;;
esac