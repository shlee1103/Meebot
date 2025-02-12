import { Sm } from "./Typography";

interface TeamMember {
  name: string;
  github: string;
}

const Footer = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "BaeJihae",
      github: "https://github.com/BaeJihae"
    },
    {
      name: "jegyun",
      github: "https://github.com/jegyun"
    },
    {
      name: "seon207",
      github: "https://github.com/seon207"
    },
    {
      name: "shlee1103",
      github: "https://github.com/shlee1103"
    },
    {
      name: "shunnnl",
      github: "https://github.com/shunnnl"
    },
    {
      name: "zlb6030",
      github: "https://github.com/zlb6030"
    },
  ];

  return (
    <footer className="w-full h-[88px] left-0 bg-gradient-to-r from-[#001D30] to-transparent flex items-center justify-center px-16 gap-8" id="footer">
      <Sm className="text-white">Copyright © 2025 3!  4!</Sm>
      <div className="flex gap-4">
        {teamMembers.map((member) => (
          <a
            key={member.name}
            href={member.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#1AEBB8] transition-colors"
          >
            {member.name}
          </a>
        ))}
      </div>
    </footer>
  )
}

export default Footer