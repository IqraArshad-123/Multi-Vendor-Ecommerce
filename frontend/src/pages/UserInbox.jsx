import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Layout/Header";
import { useSelector } from "react-redux";
import { format } from "timeago.js";
import { backend_url, server } from "../server"; // 🔥 FIXED: Path updated assuming server.js is now in src/
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import { socket } from "../utils/socket"; // 🔥 Make sure this file exists in src/utils/socket.js

const UserInbox = () => {
  const { user, loading } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [images, setImages] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);

  // Receive messages via socket
  useEffect(() => {
    socket.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text || "",
        images: data.images || null,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  // Fetch conversations
  useEffect(() => {
    const getConversations = async () => {
      try {
        if (!user?._id) return;
        const res = await axios.get(
          `${server}/api/v2/conversation/get-all-conversation-user/${user._id}`,
          { withCredentials: true }
        );
        setConversations(res.data.conversations);
      } catch (err) {
        console.error(err);
      }
    };
    getConversations();
  }, [user, messages]);

  // Add user to socket
  useEffect(() => {
    if (user) {
      socket.emit("addUser", user._id);
      socket.on("getUsers", (users) => setOnlineUsers(users));
    }
  }, [user]);

  const onlineCheck = (chat) => {
    const otherUser = chat.members.find((m) => m !== user?._id);
    return onlineUsers.some((u) => u.userId === otherUser);
  };

  // Fetch messages for current chat
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?._id) return;
      try {
        const res = await axios.get(
          `${server}/api/v2/message/get-all-messages/${currentChat._id}`
        );
        setMessages(res.data.messages);
      } catch (err) {
        console.error(err);
      }
    };
    getMessages();
  }, [currentChat]);

  // Send text message
  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find((m) => m !== user._id);

    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post(`${server}/api/v2/message/create-new-message`, message);
      setMessages([...messages, res.data.message]);
      updateLastMessage(newMessage);
    } catch (err) {
      console.error(err);
    }
  };

  const updateLastMessage = async (lastMsg) => {
    try {
      await axios.put(
        `${server}/api/v2/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: lastMsg,
          lastMessageId: user._id,
        }
      );
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  // Send image message
  const handleImageUpload = async (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setImages(reader.result);
        imageSendingHandler(reader.result);
      }
    };

    reader.readAsDataURL(e.target.files[0]);
  };

  const imageSendingHandler = async (imageSrc) => {
    const receiverId = currentChat.members.find(
      (member) => member !== user?._id
    );

    // 🔥 FIXED: socketId ko socket aur seller ko user se change kar diya
    socket.emit("sendMessage", {
      senderId: user._id, 
      receiverId,
      images: imageSrc,
    });

    try {
      const res = await axios.post(`${server}/api/v2/message/create-new-message`, {
        images: imageSrc,
        sender: user._id, // 🔥 FIXED: seller to user
        text: newMessage,
        conversationId: currentChat._id,
      });

      setImages("");
      setMessages([...messages, res.data.message]);
      updateLastMessage("📷 Photo"); // 🔥 FIXED: missing function handle ho gaya
    } catch (error) {
      console.log(error);
    }
  };

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full">
      {!open && (
        <>
          <Header />
          <h1 className="text-center text-[30px] py-3 font-Poppins">All Messages</h1>
          {conversations && conversations.map((item, index) => (
            <MessageList
              key={index}
              data={item}
              index={index}
              setOpen={setOpen}
              setCurrentChat={setCurrentChat}
              me={user?._id}
              setUserData={setUserData}
              online={onlineCheck(item)}
              setActiveStatus={setActiveStatus}
              loading={loading}
            />
          ))}
        </>
      )}

      {open && (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={user._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
          handleImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
};

const MessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  setUserData,
  online,
  setActiveStatus,
  loading,
}) => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setActiveStatus(online);
    const otherId = data.members.find((m) => m !== me);
    if (!otherId) return;

    const getUser = async () => {
      try {
        const res = await axios.get(`${server}/api/v2/seller/get-shop-info/${otherId}`);
        setUser(res.data.shop);
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
  }, [data, me]);

  const handleClick = () => {
    navigate(`/inbox?${data._id}`);
    setOpen(true);
    setCurrentChat(data);
    setUserData(user);
    setActiveStatus(online);
  };

  return (
    <div
      className={`w-full flex p-3 px-3 cursor-pointer hover:bg-[#00000010]`}
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={user?.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-[50px] h-[50px] rounded-full"
        />
        <div
          className={`w-[12px] h-[12px] rounded-full absolute top-[2px] right-[2px] ${
            online ? "bg-green-400" : "bg-[#c7b9b9]"
          }`}
        />
      </div>
      <div className="pl-3">
        <h1 className="text-[18px]">{user?.name}</h1>
        <p className="text-[16px] text-[#000c]">
          {!loading && data?.lastMessageId !== user?._id ? "You:" : `${user?.name?.split(" ")[0]}:`}{" "}
          {data?.lastMessage}
        </p>
      </div>
    </div>
  );
};

const SellerInbox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  scrollRef,
  handleImageUpload,
}) => {
  return (
    <div className="w-full min-h-full flex flex-col justify-between p-5">
      {/* Header */}
      <div className="w-full flex p-3 items-center justify-between bg-slate-200">
        <div className="flex">
          <img
            src={userData?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-[60px] h-[60px] rounded-full"
          />
          <div className="pl-3">
            <h1 className="text-[18px] font-[600]">{userData?.name}</h1>
            <h1>{activeStatus ? "Active Now" : ""}</h1>
          </div>
        </div>
        <AiOutlineArrowRight
          size={20}
          className="cursor-pointer"
          onClick={() => setOpen(false)}
        />
      </div>

      {/* Messages */}
      <div className="px-3 h-[75vh] py-3 overflow-y-scroll">
        {messages.map((item, index) => (
          <div
            key={index}
            className={`flex w-full my-2 ${
              item.sender === sellerId ? "justify-end" : "justify-start"
            }`}
            ref={scrollRef}
          >
            {item.sender !== sellerId && (
              <img
                src={userData?.avatar || "/default-avatar.png"}
                className="w-[40px] h-[40px] rounded-full mr-3"
                alt="avatar"
              />
            )}

            {item.images && (
              <img
                src={item.images.url || item.images}
                className="w-[300px] h-[300px] object-cover rounded-[10px] ml-2 mb-2"
                alt="msg-img"
              />
            )}

            {item.text && (
              <div>
                <div
                  className={`w-max p-2 rounded ${
                    item.sender === sellerId ? "bg-[#000]" : "bg-[#38c776]"
                  } text-[#fff]`}
                >
                  <p>{item.text}</p>
                </div>
                <p className="text-[12px] text-[#000000d3] pt-1">
                  {format(item.createdAt)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Send input */}
      <form
        className="p-3 w-full flex items-center gap-2 bg-white border-t"
        onSubmit={sendMessageHandler}
      >
        <div>
          <input type="file" id="image" className="hidden" onChange={handleImageUpload} />
          <label htmlFor="image">
            <TfiGallery className="cursor-pointer" size={22} />
          </label>
        </div>

        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
        />

        <button type="submit">
          <AiOutlineSend size={22} className="text-blue-600 cursor-pointer" />
        </button>
      </form>
    </div>
  );
};

export default UserInbox;