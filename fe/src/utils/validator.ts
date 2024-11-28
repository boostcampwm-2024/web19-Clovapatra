import { ERROR_MESSAGES } from '@/constants/errors';

export const validateNickname = (nickname: string): string => {
  const trimmed = nickname.trim();
  const regex = /^[a-zA-Z0-9가-힣 ]+$/;
  let error = '';

  switch (true) {
    case !trimmed:
      error = ERROR_MESSAGES.emptyNickname;
      break;
    case !regex.test(trimmed):
      error = ERROR_MESSAGES.invalidNickname;
      break;
    case trimmed.length < 2 || trimmed.length > 8:
      error = ERROR_MESSAGES.nicknameLength;
      break;
  }

  return error;
};

export const validateRoomName = (roomName: string): string => {
  const trimmed = roomName.trim();
  let error = '';

  switch (true) {
    case !trimmed:
      error = ERROR_MESSAGES.emptyRoomName;
      break;
    case trimmed.length < 2 || trimmed.length > 12:
      error = ERROR_MESSAGES.roomNameLength;
      break;
  }

  return error;
};
