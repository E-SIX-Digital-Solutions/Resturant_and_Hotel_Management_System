const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <p className="text-center py-8 text-red-500" role="alert">
      Error: {message}
    </p>
  );
};

export default ErrorMessage;
