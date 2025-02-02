import { useEffect, useState } from 'react';
import axiosClient from '../config/axios';

const useQuery = (url, refetch) => {
  const [cacheState, setCacheState] = useState([]);
  const [state, setState] = useState({
    data: null,
    isLoading: true,
    error: null,
  });

  const queryState = { success: 'success', fail: 'fail', pending: 'pending' };

  function cacheFactory({ url, _queryState, data }) {
    return { url: url, queryState: _queryState, data: data };
  }

  function getThisCacheData(url) {
    const didMatchPosition = cacheState.map(v =>
      v.url == url && v.queryState == queryState.success ? true : false
    );

    if (didMatchPosition.includes(true)) {
      const matchPosition = didMatchPosition.indexOf(true);
      const c = cacheState[matchPosition];
      return c.data;
    } else {
      console.log('didMatchPosition returning null');
      return null;
    }
  }

  useEffect(() => {
    const fetch = async () => {
      axiosClient
        .get(url)
        .then(({ data }) => {
          setState({ data, isLoading: false, error: '' });
          if (data) {
            const _queryState = queryState.success;
            const c = cacheFactory({ url, _queryState, data });
            setCacheState(v => [...v, c]);
          }
        })
        .catch(error =>
          setState({ data: null, isLoading: false, error: error.message })
        );
    };

    const _data = getThisCacheData(url);
    if (_data) {
      console.log('Use cache data');
      queueMicrotask(() => {
        const data = _data;
        setState({ data, isLoading: false, error: null });
      });
    } else {
      console.log('Use fetch data');
      fetch();
    }
  }, [url, refetch]);

  return state;
};

export default useQuery;

// import { useEffect, useState } from 'react';
// import axiosClient from '../config/axios';

// const useQuery = (url, refetch) => {
//   const [state, setState] = useState({
//     data: null,
//     isLoading: true,
//     error: '',
//   });

//   useEffect(() => {
//     const fetch = async () => {
//       axiosClient
//         .get(url)
//         .then(({ data }) => setState({ data, isLoading: false, error: '' }))
//         .catch(error =>
//           setState({ data: null, isLoading: false, error: error.message })
//         );
//     };

//     fetch();
//   }, [url, refetch]);

//   return state;
// };

// export default useQuery;
