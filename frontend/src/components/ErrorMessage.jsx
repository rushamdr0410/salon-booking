function ErrorMessage({ message, onRetry }) {
    return (
        <div className="error-box">
            <p>{message}</p>
            {onRetry && <button onClick={onRetry}>Retry</button>}
        </div>
    )
}

export default ErrorMessage