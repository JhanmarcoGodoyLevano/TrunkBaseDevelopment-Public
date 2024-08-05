export interface Communion {
  id: string;
  names: string;
  surnames: string;
  placeCommunion: string;
  enrolledCatechesis: string;
  priest: string;
  communionDate: string | null;
  comment: string;
  state: string;
}

export interface CreateCommunion {
  names: string;
  surnames: string;
  placeCommunion: string;
  enrolledCatechesis: string;
}
