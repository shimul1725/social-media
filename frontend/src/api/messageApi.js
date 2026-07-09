import API from "./axios";

// Send a message (saved to database via REST; real-time delivery happens via socket separately)
export const sendMessageAPI = async (receiverId, text) => {
  const { data } = await API.post("/messages", { receiverId, text });
  return data;
};

// Get the list of people you've chatted with (inbox)
export const fetchConversationsList = async () => {
  const { data } = await API.get("/messages");
  return data;
};

// Get the full conversation with a specific user
export const fetchConversation = async (userId) => {
  const { data } = await API.get(`/messages/${userId}`);
  return data;
};