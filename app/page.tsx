const page = () => {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex w-full items-center justify-between border-b border-zinc-400 bg-gray-100 px-6 py-3 text-black shadow-2xl">
        <div className="profile rounded-full border border-zinc-900 bg-gray-400 p-3"></div>
        <input
          className="font-name rounded-lg border border-zinc-900 px-3 py-1"
          value="Handwritten Font Name"
        />

        <div className="group relative">
          <button className="rounded border border-zinc-900 bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            Export as &darr;
          </button>
          <div className="invisible absolute right-0 mt-2 w-32 rounded border bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
            <button
              // onClick={() => handleExportFont("ttf")}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              TTF
            </button>
            <button
              // onClick={() => handleExportFont("otf")}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              OTF
            </button>
            <button
              // onClick={() => handleExportFont("woff")}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              WOFF
            </button>
          </div>
        </div>
      </header>

      <main className="grid h-full items-center text-black">
        <div className="sidebar flex h-full w-[25%] flex-col border-r border-zinc-400 bg-gray-200 shadow-2xl">
          <div className="w-full border-b border-zinc-400 px-6 py-4">
            Alphabets (A-Z)
          </div>
          <div className="w-full border-b border-zinc-400 px-6 py-4">
            Numbers (0-9)
          </div>
          <div className="w-full border-b border-zinc-400 px-6 py-4">
            Symbols
          </div>
        </div>
      </main>
    </div>
  );
};

export default page;
