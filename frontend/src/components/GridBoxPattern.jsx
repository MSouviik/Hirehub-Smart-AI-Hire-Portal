import {
  Briefcase,
  ClipboardList,
  DollarSign,
  FileText,
  UserCheck,
  Users,
  Calendar,
  Award,
  BarChart2,
  Globe,
  AtSign,
  Hash,
  Camera,
  Mic,
  Bookmark,
  Wifi,
} from "lucide-react";

const GridBoxPattern = ({ title, subtitle }) => {
  const icons = [
    Briefcase,
    ClipboardList,
    DollarSign,
    FileText,
    UserCheck,
    Users,
    Calendar,
    Award,
    BarChart2,
    Globe,
    AtSign,
    Hash,
    Camera,
    Mic,
    Bookmark,
    Wifi,
  ];

  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        {/* Branding */}
        <h1 className="text-4xl font-extrabold text-primary mb-8"></h1>

        <div className="grid grid-cols-4 gap-4 mb-10">
          {icons.map((Icon, i) => (
            <div
              key={i}
              className="aspect-square rounded-3xl bg-primary/10 flex items-center justify-center"
              style={{
                animation: "pulseBox 2s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>

      {/* Custom animation keyframes */}
      <style>{`
        @keyframes pulseBox {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
};

export default GridBoxPattern;
