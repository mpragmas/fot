import AssignedMatchtable from "./_components/AssignedMatchtable";
import WelcomeReporter from "./_components/WelcomeReporter";

const Page: React.FC = () => {
  return (
    <>
      <WelcomeReporter />
      <AssignedMatchtable />
    </>
  );
};

export default Page;
