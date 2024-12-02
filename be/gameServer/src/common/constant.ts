export enum ErrorMessages {
  ROOM_NOT_FOUND = 'RoomNotFound',
  GAME_NOT_FOUND = 'GameNotFound',
  ROOM_FULL = 'RoomFull',
  NICKNAME_TAKEN = 'NicknameTaken',
  PLAYER_NOT_FOUND = 'PlayerNotFound',
  ONLY_HOST_CAN_START = 'HostOnlyStart',
  INTERNAL_ERROR = 'InternalError',
  ALL_PLAYERS_MUST_BE_READY = 'AllPlayersMustBeReady',
  NOT_ENOUGH_PLAYERS = 'NotEnoughPlayers',
  VALIDATION_FAILED = 'ValidationFailed',
  GAME_ALREADY_IN_PROGRESS = 'GameAlreadyInProgress',
}

export enum RedisKeys {
  ROOMS_LIST = 'roomsList',
  ROOMS_UPDATE_CHANNEL = 'roomUpdate',
  ROOM_NAME_TO_ID_HASH = 'roomNamesToIds',
  ROOM_NAMES_SORTED_KEY = 'roomNames',
}

export enum RoomsConstant {
  ROOMS_MAX_PLAYERS = 4,
  ROOMS_LIMIT = 9,
}
