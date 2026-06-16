import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

type Props = {
  children: React.ReactNode;
};

export async function SiteShell({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
