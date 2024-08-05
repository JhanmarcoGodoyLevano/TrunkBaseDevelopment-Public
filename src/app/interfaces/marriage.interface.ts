export interface Marriage {
  id: string;
  namesContractor1: string;
  surnameContractor1: string;
  namesContractor2: string;
  surnamesContractor2: string;
  priest: string;
  placeMarriage: string;
  dateMarriage: string | null;
  comment: string;
  state: string;
}

export interface CreateMarriage {
  namesContractor1: string;
  surnameContractor1: string;
  namesContractor2: string;
  surnamesContractor2: string;
}
