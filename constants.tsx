import type { ReactNode } from 'react';

const BotAvatarWrapper = ({ children, color }: { children: ReactNode; color: string }) => (
  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl ${color}`}>
    {children}
  </div>
);

export const BOTS_CONFIG = [
  {
    name: "Dr. Evelyn Reed",
    personalityFile: "personalities/evelyn_reed.txt",
    // FIX: Added children to BotAvatarWrapper to resolve missing 'children' prop error.
    avatar: <BotAvatarWrapper color="bg-blue-500">ER</BotAvatarWrapper>,
    color: "text-blue-400",
  },
  {
    name: "T'Pari",
    personalityFile: "personalities/tpari.txt",
    // FIX: Added children to BotAvatarWrapper to resolve missing 'children' prop error.
    avatar: <BotAvatarWrapper color="bg-green-600">TP</BotAvatarWrapper>,
    color: "text-green-400",
  },
  {
    name: "Vael",
    personalityFile: "personalities/vael.txt",
    // FIX: Added children to BotAvatarWrapper to resolve missing 'children' prop error.
    avatar: <BotAvatarWrapper color="bg-indigo-500">V</BotAvatarWrapper>,
    color: "text-indigo-400",
  },
  {
    name: "K'gan",
    personalityFile: "personalities/kgan.txt",
    // FIX: Added children to BotAvatarWrapper to resolve missing 'children' prop error.
    avatar: <BotAvatarWrapper color="bg-red-700">K</BotAvatarWrapper>,
    color: "text-red-500",
  },
  {
    name: "Sh'Layn",
    personalityFile: "personalities/shlayn.txt",
    // FIX: Added children to BotAvatarWrapper to resolve missing 'children' prop error.
    avatar: <BotAvatarWrapper color="bg-cyan-500">SL</BotAvatarWrapper>,
    color: "text-cyan-400",
  },
];

export const USER_NAME = "You";
