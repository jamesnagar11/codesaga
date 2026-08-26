

const ProblemDescription = ({description, imgSrc}: {description: string[], imgSrc: string | null}) => {
  return (
    <div className="flex flex-col gap-5">
        <div className='text-lg flex flex-col gap-4'>
            {description.map((description, index) => (
                <div key={index}> {description }</div>
            ))}
        </div>
        {imgSrc && 
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt="Img" width={400} style={{ height: 'auto' }} />
          </div>
        }
    </div>
  )
}

export default ProblemDescription
