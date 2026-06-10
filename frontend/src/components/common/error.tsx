const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <tr>
      <td colSpan={6} className="py-12">
        <div className="flex items-center justify-center w-full">
          <h3 className="text-center py-12 text-red-500">Error: {message}</h3>
        </div>
      </td>
    </tr>
  );
};

export default ErrorMessage;
