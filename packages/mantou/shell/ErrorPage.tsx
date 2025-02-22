export const ErrorPage = (props: any) => {
  const { data } = props;
  return (
    <div>
      <h1>Error</h1>
      <pre>{JSON.stringify(data?.error, null, 2)}</pre>
    </div>
  );
};
