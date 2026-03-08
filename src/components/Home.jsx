import Notes from "./Notes";

const Home = ({ showAlert }) => {
  return (
    <div className="py-6">
      <Notes showAlert={showAlert} />
    </div>
  );
};

export default Home;
