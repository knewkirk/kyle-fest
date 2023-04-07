import { getDatabase, ref, set, get } from 'firebase/database';
import React, { useCallback, useEffect, useState } from 'react';

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

import spinner from '@images/ball-search.gif';

import './index.less';

export default () => {
  const [dbRef, setDbRef] = useState(null);
  const [lineup, setLineup] = useState([]);
  const [auth, setAuth] = useState(null);
  const [newAct, setNewAct] = useState('');
  const [error, setError] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    setAuth(auth);

    const db = getDatabase();
    const dbRef = ref(db);
    setDbRef(dbRef);

    get(dbRef)
      .then((snapshot) => {
        setIsLoading(false);
        if (snapshot.exists()) {
          setLineup(snapshot.val());
        } else {
          setIsEmpty(true);
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const login = useCallback(() => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(
      (res) => console.log(res),
      (err) => {
        console.error(err);
        setError(err);
      }
    );
  }, [auth]);

  const add = useCallback(() => {
    if (!dbRef || !newAct.length) {
      return;
    }
    set(dbRef, [...lineup, newAct]).then(
      (res) => {
        setLineup([...lineup, newAct]);
        setNewAct('');
      },
      (err) => {
        console.error(err);
        setError(err);
      }
    );
  }, [dbRef, lineup, newAct]);

  const remove = useCallback(
    (idx: number) => {
      if (!dbRef) {
        return;
      }
      const newLineup = lineup.filter((val, i) => i !== idx);
      set(dbRef, newLineup).then(
        (res) => {
          setLineup(newLineup);
          setNewAct('');
        },
        (err) => {
          console.error(err);
          setError(err);
        }
      );
    },
    [dbRef, lineup]
  );

  return (
    <div className="edit-lineup">
      <h1 className="headline">Edit Lineup</h1>
      <div className="edit-section">
        <input
          className="artist-input"
          value={newAct}
          onChange={(e) => setNewAct(e.target.value)}
        ></input>
        <button className="btn add" onClick={add}>
          +
        </button>
        <button className="btn login" onClick={login}>
          👤
        </button>
        {(error && <pre>{error}</pre>) || null}
      </div>
      {isLoading ? (
        <p className="spinner">🎧</p>
      ) : (
        <ul className="lineup-container">
          {lineup.map((val, i) => (
            <li className="artist" key={i}>
              <button className="btn remove" onClick={() => remove(i)}>
                &times;
              </button>
              {val}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
