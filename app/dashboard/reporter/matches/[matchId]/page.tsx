import MatchReportHeader from "./_components/MatchReportHeader";
import MatchRecordEvents from "./_components/MatchRecordEvents";
import MatchVenue from "./_components/MatchVenue";
import LiveTimelineSection from "./_components/LiveTimelineSection";

export default function MatchControlPage() {
  return (
    <div className="bg-whitish min-h-screen w-full p-6">
      <MatchReportHeader />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MatchRecordEvents />
        <MatchVenue />
      </div>
      <LiveTimelineSection />
    </div>
  );
}
