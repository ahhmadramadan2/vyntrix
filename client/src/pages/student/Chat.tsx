import { useEffect, useState, useRef } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../../components/ui/Avatar";
import { Spinner } from "../../components/ui/Spinner";
import { useUiStore } from "../../store/uiStore";
import { connectSocket, getSocket } from "../../lib/socket";
import { useDebounce } from "../../hooks/useDebounce";

interface Connection {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    profile?: { avatarUrl?: string };
  };
  receiver: {
    id: number;
    firstName: string;
    lastName: string;
    profile?: { avatarUrl?: string };
  };
  messages: { content: string; createdAt: string }[];
}

interface Message {
  id: number;
  connectionId: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    profile?: { avatarUrl?: string };
  };
}

interface SearchResult {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  university?: { name: string };
  profile?: { avatarUrl?: string };
}

interface PendingRequest {
  id: number;
  sender: SearchResult;
}

export const Chat = () => {
  const { student } = useAuth();
  const { addToast } = useUiStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [activeConn, setActiveConn] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);
  const [tab, setTab] = useState<"chats" | "search" | "requests">("chats");

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Connect socket on mount
  useEffect(() => {
    if (student?.id) {
      connectSocket(student.id);
      const socket = getSocket();

      socket.on("receive_message", (message: Message) => {
        if (message.connectionId === activeConn?.id) {
          setMessages((prev) => [...prev, message]);
        }
        // Update last message in connections list
        setConnections((prev) =>
          prev.map((c) =>
            c.id === message.connectionId
              ? {
                  ...c,
                  messages: [
                    { content: message.content, createdAt: message.createdAt },
                  ],
                }
              : c,
          ),
        );
      });

      return () => {
        socket.off("receive_message");
      };
    }
  }, [student?.id, activeConn?.id]);

  // Fetch connections and pending requests
  useEffect(() => {
    Promise.all([
      api.get("/chat/connections"),
      api.get("/chat/connections/pending"),
    ])
      .then(([connRes, pendRes]) => {
        setConnections(connRes.data.data);
        setPending(pendRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Search students
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }
    api
      .get(`/chat/search?q=${debouncedSearch}`)
      .then((r) => setSearchResults(r.data.data))
      .catch(() => {});
  }, [debouncedSearch]);

  // Load messages when active connection changes
  useEffect(() => {
    if (!activeConn) return;
    api
      .get(`/chat/connections/${activeConn.id}/messages`)
      .then((r) => setMessages(r.data.data))
      .catch(() => {});
  }, [activeConn?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getOtherPerson = (conn: Connection) => {
    if (!student) return conn.sender;
    return conn.senderId === student.id ? conn.receiver : conn.sender;
  };

  const handleSendConnectionRequest = async (receiverId: number) => {
    setSendingRequest(receiverId);
    try {
      await api.post("/chat/connections", { receiverId });
      addToast("Connection request sent!", "success");
      setSearchResults((prev) => prev.filter((s) => s.id !== receiverId));
    } catch (err: any) {
      addToast(
        err.response?.data?.message || "Failed to send request",
        "error",
      );
    } finally {
      setSendingRequest(null);
    }
  };

  const handleRespond = async (
    connectionId: number,
    status: "ACCEPTED" | "REJECTED",
  ) => {
    try {
      await api.put(`/chat/connections/${connectionId}/respond`, { status });
      setPending((prev) => prev.filter((r) => r.id !== connectionId));
      if (status === "ACCEPTED") {
        const connRes = await api.get("/chat/connections");
        setConnections(connRes.data.data);
        addToast("Connection accepted!", "success");
      }
    } catch {
      addToast("Failed to respond", "error");
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConn || !student) return;
    const other = getOtherPerson(activeConn);
    const socket = getSocket();
    socket.emit("send_message", {
      connectionId: activeConn.id,
      senderId: student.id,
      receiverId: other.id,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 bg-dark-800 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 border-r border-slate-700/50 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white mb-3">Messages</h2>
          <div className="flex gap-1">
            {(["chats", "search", "requests"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  tab === t
                    ? "bg-primary-500/20 text-primary-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t}
                {t === "requests" && pending.length > 0 && (
                  <span className="ml-1 bg-primary-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                    {pending.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chats Tab */}
        {tab === "chats" && (
          <div className="flex-1 overflow-y-auto">
            {connections.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-500 text-sm">No connections yet.</p>
                <button
                  onClick={() => setTab("search")}
                  className="text-primary-400 text-sm mt-2 hover:underline"
                >
                  Find students to connect
                </button>
              </div>
            ) : (
              connections.map((conn) => {
                const other = getOtherPerson(conn);
                const fullName = `${other.firstName} ${other.lastName}`;
                const lastMsg = conn.messages[0];
                return (
                  <div
                    key={conn.id}
                    onClick={() => setActiveConn(conn)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-800/50 transition-all border-b border-slate-700/20 ${
                      activeConn?.id === conn.id
                        ? "bg-primary-500/10 border-l-2 border-l-primary-500"
                        : ""
                    }`}
                  >
                    <Avatar
                      name={fullName}
                      avatarUrl={other.profile?.avatarUrl}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {fullName}
                      </p>
                      {lastMsg && (
                        <p className="text-xs text-slate-500 truncate">
                          {lastMsg.content}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Search Tab */}
        {tab === "search" && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-3 border-b border-slate-700/50">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-700/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {searchResults.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-4 border-b border-slate-700/20"
                >
                  <Avatar
                    name={`${s.firstName} ${s.lastName}`}
                    avatarUrl={s.profile?.avatarUrl}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{s.department}</p>
                  </div>
                  <button
                    onClick={() => handleSendConnectionRequest(s.id)}
                    disabled={sendingRequest === s.id}
                    className="px-2 py-1 rounded-lg bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs hover:bg-primary-500/30 transition-all disabled:opacity-50"
                  >
                    {sendingRequest === s.id ? "..." : "+ Connect"}
                  </button>
                </div>
              ))}
              {debouncedSearch && searchResults.length === 0 && (
                <p className="text-slate-500 text-sm text-center p-6">
                  No students found
                </p>
              )}
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {tab === "requests" && (
          <div className="flex-1 overflow-y-auto">
            {pending.length === 0 ? (
              <p className="text-slate-500 text-sm text-center p-6">
                No pending requests
              </p>
            ) : (
              pending.map((req) => (
                <div key={req.id} className="p-4 border-b border-slate-700/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar
                      name={`${req.sender.firstName} ${req.sender.lastName}`}
                      avatarUrl={req.sender.profile?.avatarUrl}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {req.sender.firstName} {req.sender.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {req.sender.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(req.id, "ACCEPTED")}
                      className="flex-1 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs hover:bg-green-500/30 transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, "REJECTED")}
                      className="flex-1 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/30 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Panel — Chat Window */}
      <div className="flex-1 flex flex-col">
        {!activeConn ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-3xl">
              💬
            </div>
            <p className="text-slate-400">
              Select a conversation to start chatting
            </p>
            <button
              onClick={() => setTab("search")}
              className="text-primary-400 text-sm hover:underline"
            >
              Or find new connections →
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
              {(() => {
                const other = getOtherPerson(activeConn);
                const fullName = `${other.firstName} ${other.lastName}`;
                return (
                  <>
                    <Avatar
                      name={fullName}
                      avatarUrl={other.profile?.avatarUrl}
                      size="sm"
                    />
                    <div>
                      <p className="font-semibold text-white">{fullName}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.senderId === student?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    {!isMe && (
                      <Avatar
                        name={`${msg.sender.firstName} ${msg.sender.lastName}`}
                        avatarUrl={msg.sender.profile?.avatarUrl}
                        size="xs"
                      />
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? "bg-primary-500 text-white rounded-br-sm"
                          : "bg-dark-700 text-slate-200 border border-slate-700/50 rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  className="flex-1 px-4 py-3 rounded-xl bg-dark-900 border border-slate-700/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
