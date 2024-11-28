export const ERROR_MESSAGES = Object.freeze({
  emptyNickname: '닉네임을 입력해주세요.',
  duplicatedNickname: '이미 사용 중인 닉네임입니다.',
  emptyRoomName: '방 제목을 입력해주세요.',
  invalidNickname: '닉네임은 한글, 영문, 숫자, 공백만 사용 가능합니다.',
  nicknameLength: '닉네임은 2~8자로 입력해주세요.',
  roomNameLength: '방 제목은 2~12자로 입력해주세요.',
});

export const ERROR_CODES = Object.freeze({
  duplicatedNickname: 'NicknameTaken',
  validation: 'ValidationFailed',
  noRoom: 'RoomNotFound',
  noGame: 'GameNotFound',
  noPlayer: 'PlayerNotFound',
  serverError: 'InternalError',
  fullRoom: 'RoomFull',
  notAllReady: 'AllPlayersMustBeReady',
  notEnoughPlayers: 'NotEnoughPlayers',
});
