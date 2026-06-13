import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import { backend_url, server } from "../../server";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import styles from "../../styles/styles";
import { TfiGallery } from "react-icons/tfi";
import { format } from "timeago.js";

const socketId = { on() {}, emit() {}, off() {} };;

const DashboardMessages = () => {
  const { seller, isLoading } = useSelector((state) => state.seller);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [images,setImages] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);

  // ✅ Listen for incoming socket messages
  useEffect(() => {
    socketId.on("getMessage", (data) => {
      console.log("Incoming message:", data);
      setArrivalMessage({
        sender: data.senderId,
        text: data.text || "",
        images: data.images || null,
        createdAt: Date.now(),
      });
    });
  }, []);

  // ✅ Push new arrival messages to state
  useEffect(() => {
    if (
      arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender)
    ) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  // ✅ Load all conversations
  useEffect(() => {
    const getConversation = async () => {
      console.log("coversations getting is called");
      try {
        console.log("entered in try of ge conv");
        const response = await axios.get(
          `${server}/api/v2/conversation/get-all-conversation-seller/${seller?._id}`,
          { withCredentials: true }
        );
        console.log(response.data);
        setConversations(response.data.conversations);
      } catch (error) {
        console.log("entered in catch of ge conv");
        console.log(error);
      }
    };
    if (seller?._id) getConversation();
  }, [seller, messages]);

  // ✅ Add user to socket
  useEffect(() => {
    if (seller) {
      socketId.emit("addUser", seller._id);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [seller]);

  // ✅ Check if chat member is online
  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((m) => m !== seller?._id);
    const online = onlineUsers.find((user) => user.userId === chatMembers);
    return online ? true : false;
  };

  // ✅ Load chat messages
  useEffect(() => {
    const getMessage = async () => {
      try {
        if (currentChat?._id) {
          const response = await axios.get(
            `${server}/api/v2/message/get-all-messages/${currentChat._id}`
          );
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getMessage();
  }, [currentChat]);

  // ✅ Send text message
  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender: seller?._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== seller._id
    );

    // send via socket
    socketId.emit("sendMessage", {
      senderId: seller._id,
      receiverId,
      text: newMessage,
    });

    // save in DB
    try {
      console.log("pic ai ty hai a")
      const res = await axios.post(
        `${server}/api/v2/message/create-new-message`,
        message
      );
      setMessages([...messages, res.data.message]);
      updateLastMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Update last message
  const updateLastMessage = async (lastMsg) => {
    socketId.emit("updateLastMessage", {
      lastMessage: lastMsg,
      lastMessageId: seller._id,
    });

    try {
      await axios.put(
        `${server}/api/v2/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: lastMsg,
          lastMessageId: seller._id,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

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



  // ✅ Send image message
  const imageSendingHandler = async (file) => {
    const receiverId = currentChat.members.find(
      (member) => member !== seller?._id
    );

    const formData = new FormData();
    formData.append("image", file);
    formData.append("sender", seller._id);
    formData.append("conversationId", currentChat._id);

    try {
      const res = await axios.post(
        `${server}/api/v2/message/create-new-message`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessages((prev) => [...prev, res.data.message]);

      socketId.emit("sendMessage", {
        senderId: seller._id,
        receiverId,
        images: res.data.message.images,
      });

      updateLastMessage("Photo");
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Auto scroll down
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-[90%] bg-white m-5 h-[85vh] ml-50 overflow-y-scroll rounded">
      {!open && (
        <>
          <h1 className="text-center text-[30px] py-3 font-Poppins">
            All Messages
          </h1>
          {conversations &&
            conversations.map((item, index) => (
              <MessageList
                data={item}
                key={index}
                index={index}
                setOpen={setOpen}
                setCurrentChat={setCurrentChat}
                me={seller._id}
                setUserData={setUserData}
                userData={userData}
                online={onlineCheck(item)}
                setActiveStatus={setActiveStatus}
                isLoading={isLoading}
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
          sellerId={seller._id}
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
  isLoading,
}) => {
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  const handleClick = (id) => {
    navigate(`/dashboard-messages?${id}`);
    setOpen(true);
  };

  useEffect(() => {
    const userId = data.members.find((user) => user !== me);

    const getUser = async () => {
      try {
        const res = await axios.get(`${server}/api/v2/user/user-info/${userId}`);
        setUser(res.data.user);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [me, data]);

  return (
    <div
      className={`w-full flex p-3 px-3 ${
        active === index ? "bg-[#00000010]" : "bg-transparent"
      } cursor-pointer`}
      onClick={(e) =>
        setActive(index) ||
        handleClick(data._id) ||
        setCurrentChat(data) ||
        setUserData(user) ||
        setActiveStatus(online)
      }
    >
      <div className="relative">
        <img
          src="http://localhost:8000/82470b4ed44c3edacfcd4201e2297050-1781110371927-17520139.png"
          alt=""
          className="w-[50px] h-[50px] rounded-full"
        />
        {online ? (
          <div className="w-[12px] h-[12px] bg-green-400 rounded-full absolute top-[2px] right-[2px]" />
        ) : (
          <div className="w-[12px] h-[12px] bg-[#c7b9b9] rounded-full absolute top-[2px] right-[2px]" />
        )}
      </div>
      <div className="pl-3">
        <h1 className="text-[18px]">{user?.name}</h1>
        <p className="text-[16px] text-[#000c]">
          {!isLoading && data?.lastMessageId !== user?._id
            ? "You:"
            : user?.name
            ? user.name.split(" ")[0] + ": "
            : ""}{" "}
          {data?.lastMessage}
        </p>
      </div>
    </div>
  );
};

const SellerInbox = ({
  scrollRef,
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  handleImageUpload,
}) => {
  return (
    <div className="w-full min-h-full flex flex-col justify-between">
      {/* header */}
      <div className="w-full flex p-3 items-center justify-between bg-slate-200">
        <div className="flex">
          <img
            src="http://localhost:8000/82470b4ed44c3edacfcd4201e2297050-1781110371927-17520139.png"
            alt=""
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

      {/* messages */}
      <div className="px-3 h-[65vh] py-3 overflow-y-scroll">
        {messages &&
          messages.map((item, index) => (
            <div
              key={index}
              className={`flex w-full my-2 ${
                item.sender === sellerId ? "justify-end" : "justify-start"
              }`}
              ref={scrollRef}
            >
              {item.sender !== sellerId && (
                <img
                  src="http://localhost:8000/82470b4ed44c3edacfcd4201e2297050-1781110371927-17520139.png"
                  className="w-[40px] h-[40px] rounded-full mr-3"
                  alt=""
                />
              )}

              <div>
                {item.images && (
                  <>
                    {Array.isArray(item.images) ? (
                      item.images.map((img, i) => (
                        <img
                          key={i}
                          src={
                            img.url
                              ? `${img.url}`
                              : img.startsWith("data:")
                              ? img
                              : `${img}`
                          }
                          className="w-[150px] h-[150px] object-cover rounded-[10px] mb-2"
                          alt="message-img"
                        />
                      ))
                    ) : (
                      <img
                        src={
                          item.images.url
                            ? `${item.images.url}`
                            : item.images.startsWith("data:")
                            ? item.images
                            : `${item.images}`
                        }
                        className="w-[150px] h-[150px] object-cover rounded-[10px]"
                        alt="message-img"
                      />
                    )}
                  </>
                )}

                {item.text && (
                  <div>
                    <div
                      className={`w-max p-2 rounded ${
                        item.sender === sellerId ? "bg-[#000]" : "bg-[#38c776]"
                      } text-[#fff] h-min`}
                    >
                      <p>{item.text}</p>
                    </div>
                    <p className="text-[12px] text-[#000000d3] pt-1">
                      {format(item.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* input */}
      <form
        className="p-3 relative w-full flex justify-between items-center"
        onSubmit={sendMessageHandler}
      >
        <div className="w-[30px]">
          <input
            type="file"
            id="image"
            className="hidden"
            onChange={handleImageUpload}
          />
          <label htmlFor="image">
            <TfiGallery className="cursor-pointer" size={20} />
          </label>
        </div>
        <div className="w-full">
          <input
            type="text"
            required
            placeholder="Enter your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`${styles.input}`}
          />
          <input type="submit" value="Send" className="hidden" id="send" />
          <label htmlFor="send">
            <AiOutlineSend
              size={20}
              className="absolute right-4 top-5 cursor-pointer"
            />
          </label>
        </div>
      </form>
    </div>
  );
};

export default DashboardMessages;