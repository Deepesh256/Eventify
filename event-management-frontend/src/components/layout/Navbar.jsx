import { Search, User } from "lucide-react";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="w-full h-16 bg-white/10 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 text-white">

      {/* Search */}
      <div className="flex items-center bg-white/10 px-3 py-2 rounded-xl w-1/3">
        <Search size={18} className="text-gray-300" />
        <input
          type="text"
          placeholder="Search events..."
          className="bg-transparent outline-none ml-2 text-sm w-full placeholder-gray-400"
        />
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        <User size={20} />
        <span>{user?.name}</span>
      </div>
    </div>
  );
};

export default Navbar;