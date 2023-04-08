import { getDatabase, ref, set, get } from 'firebase/database';
import React, { useCallback, useEffect, useState } from 'react';

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';

import './index.less';

export default () => {
  const [dbRef, setDbRef] = useState(null);
  const [lineup, setLineup] = useState([]);
  const [auth, setAuth] = useState(null);
  const [newAct, setNewAct] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(null);
  const [UID, setUID] = useState('');

  useEffect(() => {
    const _auth = getAuth();
    setAuth(_auth);

    onAuthStateChanged(_auth, (user) => {
      if (user) {
        const uid = user.uid;
        setUID(uid);
        setIsLoggedOut(false);
      } else {
        setIsLoggedOut(true);
      }
    });

    const db = getDatabase();
    const dbRef = ref(db);
    setDbRef(dbRef);

    get(dbRef)
      .then((snapshot) => {
        setIsLoading(false);
        if (snapshot.exists()) {
          setLineup(snapshot.val());
        } else {
          console.warn('No data available');
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
    const toAdd = newAct.trim();
    if (!dbRef || !toAdd.length) {
      return;
    }
    set(dbRef, [...lineup, toAdd]).then(
      (res) => {
        setLineup([...lineup, toAdd]);
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
      {isLoading ? (
        <p className="spinner">🎧</p>
      ) : (
        <>
          <div className="edit-section">
            {isLoggedOut ? (
              <button className="btn login" onClick={login}>
                Log In
              </button>
            ) : (
              <>
                <input
                  className="artist-input"
                  value={newAct}
                  onChange={(e) => setNewAct(e.target.value)}
                ></input>
                <button className="btn add" onClick={add}>
                  +
                </button>
              </>
            )}
            {(error && <pre>{error}</pre>) || null}
          </div>
          <ul className="lineup-container">
            {lineup.map((val, i) => (
              <li className="artist" key={i}>
                {(!isLoggedOut && (
                  <button className="btn remove" onClick={() => remove(i)}>
                    &times;
                  </button>
                )) ||
                  null}
                {val}
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="uid">{UID}</p>
    </div>
  );
};
