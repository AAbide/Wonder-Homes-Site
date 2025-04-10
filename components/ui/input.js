export const Input = ({ className = "", ...props }) => {
  return (
    <input
      {...props}
      className={`border border-gray-300 px-4 py-2 rounded w-full ${className}`}
    />
  );
};
