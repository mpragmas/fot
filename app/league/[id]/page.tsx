export default function Overview({ params }: { params: { id: string } }) {
  return <div>Overview content for League {params.id}</div>;
}
