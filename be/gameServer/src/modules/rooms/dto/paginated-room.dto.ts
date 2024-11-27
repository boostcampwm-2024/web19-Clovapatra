import { RoomDataDto } from './room-data.dto';

export class PaginatedRoomDto {
  rooms: RoomDataDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
