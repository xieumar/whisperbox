export interface User {
  id: string;
  username: string;
  display_name: string;
  public_key?: string;
  wrapped_private_key?: string;
  pbkdf2_salt?: string;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  text: string;
  sentAt: string;
  isMine: boolean;
  status?: "sending" | "sent" | "error";
}

export interface Conversation {
  id?: string;
  user_id: string;
  username: string;
  display_name: string;
  last_message_at?: string;
}