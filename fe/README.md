## 🔍 문제 해결 과정

### 새로운 게임방이 추가될 때 순서대로 추가되지 않음

### 게임 페이지에서 새로고침하면 렌더링이 완전히 되지 않음

- VolumeBar `defaultValue` state 업데이트가 연속적으로 발생할 수 있는 구조
- Controlled Component? Uncontrolled Component? 혼용하면 무한 상태 업데이트 루프 발생?

## 게임 페이지에서 새로고침하면 players 방장을 제외하고 사라짐, 마이크도 안 됨

- 새로고침이 아주 문제다!
