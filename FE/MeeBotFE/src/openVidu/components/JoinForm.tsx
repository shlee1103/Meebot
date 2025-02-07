import React from 'react';

interface JoinFormProps {
  myUserName: string;
  mySessionId: string;
  setMyUserName: (name: string) => void;
  setMySessionId: (id: string) => void;
  onJoin: () => void;
}

const JoinForm: React.FC<JoinFormProps> = ({
  myUserName,
  mySessionId,
  setMyUserName,
  setMySessionId,
  onJoin
}) => {
  return (
    <div className="p-0">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Join a video session</h1>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onJoin();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Participant:</label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              type="text"
              value={myUserName}
              onChange={(e) => setMyUserName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Session:</label>
            <input
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              type="text"
              value={mySessionId}
              onChange={(e) => setMySessionId(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            JOIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinForm;