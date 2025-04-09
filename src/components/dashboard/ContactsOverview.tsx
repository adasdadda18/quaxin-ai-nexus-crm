
import { Users, Phone, Mail, Plus, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const contacts = [
  {
    id: "contact-1",
    name: "Nguyễn Văn A",
    company: "Công ty ABC",
    email: "nguyenvana@abc.com",
    phone: "+84 901 234 567",
    score: 85,
    lastContact: "2 ngày trước",
    avatar: "",
  },
  {
    id: "contact-2",
    name: "Trần Thị B",
    company: "Tập đoàn XYZ",
    email: "tranthi@xyz.com",
    phone: "+84 902 345 678",
    score: 72,
    lastContact: "4 ngày trước",
    avatar: "",
  },
  {
    id: "contact-3",
    name: "Lê Văn C",
    company: "Doanh nghiệp DEF",
    email: "levanc@def.com",
    phone: "+84 903 456 789",
    score: 91,
    lastContact: "Hôm nay",
    avatar: "",
  },
];

const ContactCard = ({ contact }: { contact: typeof contacts[0] }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
      <Avatar>
        <AvatarImage src={contact.avatar} alt={contact.name} />
        <AvatarFallback className="bg-quaxin-light text-quaxin-dark">
          {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{contact.name}</h4>
          <div className="flex items-center">
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `rgba(79, 70, 229, ${contact.score / 100})`,
                color: contact.score > 50 ? 'white' : 'currentColor'
              }}
            >
              {contact.score}%
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{contact.company}</p>
        
        <div className="flex items-center gap-4 mt-2">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Phone className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Mail className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const ContactsOverview = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Liên hệ gần đây</CardTitle>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-1" />
            Xem tất cả
          </Button>
        </div>
        <CardDescription>Quản lý mối quan hệ khách hàng</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 mb-4">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
        
        <Button variant="ghost" className="w-full justify-center text-muted-foreground">
          <Plus className="h-4 w-4 mr-1" />
          Thêm liên hệ mới
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContactsOverview;
