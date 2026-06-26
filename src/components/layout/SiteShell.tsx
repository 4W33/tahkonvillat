import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MainWithNavOffset } from "./MainWithNavOffset";

type Props = {
  children: React.ReactNode;
};

export async function SiteShell({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <MainWithNavOffset>{children}</MainWithNavOffset>
      <Footer />
    </div>
  );
}
