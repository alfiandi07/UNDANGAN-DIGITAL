export type Attendance = "hadir" | "tidak_hadir" | "ragu";

export type Rsvp = {
  id: number;
  invitation_id: number;
  guest_name: string;
  attendance: Attendance;
  pax: number;
  message: string;
  created_at?: string;
};

export type CreateRsvpInput = {
  guest_name: string;
  attendance: Attendance;
  pax?: number;
  message: string;
};
