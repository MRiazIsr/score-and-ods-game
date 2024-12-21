import "../globals.css";


export const SubmitButton = ({buttonText}: {buttonText: string}) => {
    return (
        <button className="bg-[var(--background)] hover:border-amber-400 text-white font-bold py-2 px-4 rounded-lg">
            {buttonText}
        </button>
    )
}