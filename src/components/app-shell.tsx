"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, BriefcaseBusiness, ChevronRight, FlaskConical, GitFork, House, Map, Menu, Settings2, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useLab } from "./lab-provider";
const navigation = [
  { href: "/", label: "My workspace", icon: House }, { href: "/roadmap", label: "Learning path", icon: Map },
  { href: "/projects", label: "Project studio", icon: FlaskConical }, { href: "/resources", label: "Resource library", icon: BookOpen },
  { href: "/certifications", label: "Certifications", icon: ShieldCheck }, { href: "/portfolio", label: "GitHub & portfolio", icon: GitFork },
  { href: "/career", label: "Career & resume", icon: BriefcaseBusiness },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const { state, storageError, ready } = useLab(); const [open, setOpen] = useState(false);
  const title = path.startsWith("/mission") ? "Mission workspace" : navigation.find(n => n.href === path)?.label ?? "Your preferences";
  return <div className="app-frame"><a className="skip-link" href="#main">Skip to content</a>
    {open && <button className="mobile-shade" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? "is-open" : ""}`}>
      <Link href="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark"><FlaskConical size={23} /></span><span>DrVelu<span className="brand-sub">AI ENGINEERING LAB</span></span></Link>
      <button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20}/></button>
      <div className="nav-label">YOUR LEARNING SPACE</div><nav aria-label="Main navigation">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined} className={`nav-link ${path === href ? "active" : ""}`}><Icon size={19} strokeWidth={1.7}/>{label}{path === href && <span className="nav-dot"/>}</Link>)}</nav>
      <div className="sidebar-bottom"><div className="growth-note"><span className="small-spark">✳</span><strong>Small steps. Real skills.</strong><p>You don’t need to know everything.<br/>Just your next step.</p><Link href="/roadmap">See your path <ArrowUpRight size={15}/></Link></div>
      <Link href="/settings" className="profile-link"><span className="avatar">{state.profile.name.slice(0, 1).toUpperCase()}</span><span><strong>{state.profile.name}</strong><small>Your personal learning lab</small></span><Settings2 size={17}/></Link></div>
    </aside>
    <div className="main-frame"><header className="topbar"><div className="breadcrumbs"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={20}/></button><span>My lab</span><ChevronRight size={14}/><strong>{title}</strong></div><Link href="/settings" className="save-status"><span className="status-dot"/>{storageError?"Saving needs attention":ready?"Saved in this browser":"Opening your progress…"} <span className="avatar mini">{state.profile.name.slice(0,1).toUpperCase()}</span></Link></header>
      <main id="main" tabIndex={-1}>{storageError && <div className="notice error" role="alert">{storageError}</div>}{children}</main>
      <footer className="footer"><span>Made for your next small win.</span><span>Learn · Practice · Build · Prove</span></footer>
    </div></div>;
}
