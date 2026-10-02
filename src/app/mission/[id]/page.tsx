import { notFound } from "next/navigation";
import { missionById, missions } from "@/data/curriculum";
import { MissionWorkspace } from "@/components/mission-workspace";
export function generateStaticParams() { return missions.map(m=>({id:m.id})); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const {id}=await params; return {title:missionById(id)?.title??"Mission not found"}; }
export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) { const {id}=await params;const mission=missionById(id);if(!mission)notFound();return <MissionWorkspace mission={mission}/>; }
