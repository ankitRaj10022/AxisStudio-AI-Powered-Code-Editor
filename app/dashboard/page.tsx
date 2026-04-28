import DashboardExperience from "@/features/dashboard/components/dashboard-experience";
import {
  deleteProjectById,
  duplicateProjectById,
  editProjectById,
  getAllPlaygroundForUser,
} from "@/features/playground/actions";

const DashboardMainPage = async () => {
  const playgrounds = await getAllPlaygroundForUser();

  return (
    <DashboardExperience
      projects={playgrounds || []}
      onDeleteProject={deleteProjectById}
      onUpdateProject={editProjectById}
      onDuplicateProject={duplicateProjectById}
    />
  );
};

export default DashboardMainPage;
