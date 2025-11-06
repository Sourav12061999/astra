export default function LoadingIndicator({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;
  
  return (
    <div className="loading-indicator">
      <div className="spinner" />
    </div>
  );
}
