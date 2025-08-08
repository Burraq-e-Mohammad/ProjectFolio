import { useQuery } from "@tanstack/react-query";
import { contactAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AdminContactMessages = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminContactMessages'],
    queryFn: contactAPI.getAllMessages,
  });
  const { toast } = useToast();
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReply = async (messageId: string) => {
    setLoading(true);
    try {
      await contactAPI.replyToMessage(messageId, { subject, replyMessage });
      toast({ title: "Reply sent!", description: "The user has been emailed." });
      setReplyingId(null);
      setSubject("");
      setReplyMessage("");
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to send reply.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading messages</div>;

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.data?.messages?.length === 0 ? (
            <p>No messages found.</p>
          ) : (
            <ul className="space-y-6">
              {data.data.messages.map((msg: any) => (
                <li key={msg._id} className="border-b pb-4">
                  <div className="mb-2">
                    <strong>{msg.firstName} {msg.lastName}</strong> ({msg.email})<br />
                    <em>{msg.subject}</em><br />
                    <span>{msg.message}</span><br />
                    <small>{new Date(msg.createdAt).toLocaleString()}</small>
                  </div>
                  {replyingId === msg._id ? (
                    <div className="space-y-2 mt-2">
                      <Input
                        placeholder="Reply subject"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="mb-2"
                      />
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        rows={4}
                        className="mb-2"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReply(msg._id)}
                          disabled={loading || !subject || !replyMessage}
                        >
                          {loading ? "Sending..." : "Send Reply"}
                        </Button>
                        <Button variant="outline" onClick={() => setReplyingId(null)} disabled={loading}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => {
                      setReplyingId(msg._id);
                      setSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
                      setReplyMessage("");
                    }}>
                      Reply
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContactMessages;
