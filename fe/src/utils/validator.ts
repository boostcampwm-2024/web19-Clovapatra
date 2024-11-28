export const validateNickname = (nickname: string) => {
  const regex = /^[a-zA-Z0-9가-힣 ]+$/;
  if (!nickname.trim()) return '닉네임을 입력해주세요.';
  if (!regex.test(nickname))
    return '닉네임은 한글, 영문, 숫자, 공백만 사용 가능합니다.';
  if (nickname.length < 2 || nickname.length > 8)
    return '닉네임은 2~8자로 입력해주세요.';

  return '';
};

export const validateRoomName = (roomName: string) => {
  if (!roomName.trim()) return '방 제목을 입력해주세요.';
  if (roomName.length < 2 || roomName.length > 12)
    return '방 제목은 2~12자로 입력해주세요.';
  return '';
};
