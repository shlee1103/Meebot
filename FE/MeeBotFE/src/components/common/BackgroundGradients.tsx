import React from 'react'

const BackgroundGradients = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-5">
      <div
        className="absolute"
        style={{
          width: '50vw',
          height: '50vh',
          maxWidth: '600px',
          maxHeight: '600px',
          left: '-5vw',
          top: '-5vh',
          background: `linear-gradient(41.94deg, 
            rgba(147, 88, 247, 0.2) 0%, 
            rgba(146, 89, 247, 0.2) 8.3%, 
            rgba(142, 93, 246, 0.2) 16.59%, 
            rgba(136, 98, 245, 0.2) 24.89%, 
            rgba(128, 107, 244, 0.2) 33.19%, 
            rgba(117, 117, 242, 0.2) 41.49%, 
            rgba(104, 130, 240, 0.2) 49.78%, 
            rgba(89, 144, 238, 0.2) 58.08%, 
            rgba(74, 159, 235, 0.2) 66.38%, 
            rgba(59, 173, 233, 0.2) 74.68%, 
            rgba(46, 186, 231, 0.2) 82.97%, 
            rgba(35, 196, 229, 0.2) 91.27%, 
            rgba(27, 205, 228, 0.2) 99.57%, 
            rgba(21, 210, 227, 0.2) 107.87%, 
            rgba(17, 214, 226, 0.2) 116.16%, 
            rgba(16, 215, 226, 0.2) 124.46%)`,
          mixBlendMode: 'normal',
          filter: 'blur(10vw)',
        }}
      />

      <div
        className="absolute"
        style={{
          width: '40vw',
          height: '40vh',
          maxWidth: '500px',
          maxHeight: '500px',
          left: '70vw',
          top: '30vh',
          background: `linear-gradient(67.52deg, 
            rgba(108, 172, 228, 0.25) 0%, 
            rgba(108, 172, 228, 0.25) 6.16%, 
            rgba(109, 173, 228, 0.25) 12.31%, 
            rgba(111, 174, 229, 0.25) 18.47%, 
            rgba(114, 176, 229, 0.25) 24.63%, 
            rgba(117, 179, 230, 0.25) 30.79%, 
            rgba(121, 182, 231, 0.25) 36.94%, 
            rgba(125, 185, 232, 0.25) 43.1%, 
            rgba(130, 189, 234, 0.25) 49.26%, 
            rgba(134, 192, 235, 0.25) 55.42%, 
            rgba(138, 195, 236, 0.25) 61.57%, 
            rgba(141, 198, 237, 0.25) 67.73%, 
            rgba(144, 200, 237, 0.25) 73.89%, 
            rgba(146, 201, 238, 0.25) 80.05%, 
            rgba(147, 202, 238, 0.25) 86.2%, 
            rgba(147, 202, 238, 0.25) 92.36%)`,
          filter: 'blur(8vw)',
        }}
      />
    </div>
  )
}

export default BackgroundGradients
