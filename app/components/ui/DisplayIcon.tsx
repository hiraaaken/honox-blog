export const DisplayIcon = ({ color = "currentColor" }: { color?: string }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3 5.25C3 4.42157 3.67157 3.75 4.5 3.75H19.5C20.3284 3.75 21 4.42157 21 5.25V15.25C21 16.0784 20.3284 16.75 19.5 16.75H4.5C3.67157 16.75 3 16.0784 3 15.25V5.25ZM4.5 5.25H19.5V15.25H4.5V5.25Z"
        fill={color}
      />
      <path
        d="M8.25 19.5C8.25 19.0858 8.58579 18.75 9 18.75H15C15.4142 18.75 15.75 19.0858 15.75 19.5C15.75 19.9142 15.4142 20.25 15 20.25H9C8.58579 20.25 8.25 19.9142 8.25 19.5Z"
        fill={color}
      />
    </svg>
  )
}
