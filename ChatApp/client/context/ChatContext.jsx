import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext()

export const ChatProvider = ({children})=>{

    const [messages,setMessages] = useState([])
    const [users,setusers] = useState([])
    const [selectedUser,setSelectedUser] = useState(null)
    const [unseenMessages,setUnseenMessages] = useState({})

    const {socket,axios} = useContext(AuthContext)

    // get all users for sidebar
    const getUsers = async ()=>{
        try {
            const {data} = await axios.get("/api/messages/users")
            if(data.success){
                setusers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // messages for the selected user 
    const getMessages = async (userId)=>{
        try {
            const {data} = await axios.get(`/api/messages/${userId}`)
            if(data.success){
                setMessages(data.messages)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // send message to selected user
    const sendMessage = async (messageData) => {
        try {
            if (!selectedUser) return toast.error("No user selected");

            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);

            if (data.success) {
            // Add the new message to messages state immediately
            setMessages((prevMessages) => [...prevMessages, data.newMessage]);
            } else {
            toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


    // to subscribe to messages for selected user
    const subscribeToMessages = async ()=>{
        if(!socket) return

        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true
                setMessages((prevMess)=>[...prevMess,newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`)
            }else{
                if(!newMessage.senderId) return
                setUnseenMessages((prevUnseenmess)=>({
                    ...prevUnseenmess,[newMessage.senderId] : prevUnseenmess[newMessage.senderId] ? prevUnseenmess[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    // unsubscribe to messages 
    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage")
    }

    useEffect(()=>{
        subscribeToMessages()
        return () => unsubscribeFromMessages()
    },[socket,selectedUser])


    const value = {
        messages,
        users,
        selectedUser,getUsers,
        setMessages,sendMessage,setSelectedUser,
        unseenMessages,setUnseenMessages,getMessages
    }

    return (
    <ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>
    )
}