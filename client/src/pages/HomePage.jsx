import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faMoneyBillWave, faCalculator } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="row justify-content-center my-5">
        <div className="col-md-10 text-center">
          <h1 className="display-4 mb-4">Split Expenses with Friends, Simplified</h1>
          <p className="lead mb-5">
            Money Splitter helps you track and split expenses with friends, roommates, or anyone.
            No more awkward money talks or complicated calculations.
          </p>

          {!user ? (
            <div className="d-flex justify-content-center gap-3">
              <Link to="/register" className="btn btn-primary btn-lg">
                Sign Up - It's Free
              </Link>
              <Link to="/login" className="btn btn-outline-primary btn-lg">
                Login
              </Link>
            </div>
          ) : (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="row my-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <FontAwesomeIcon icon={faUsers} size="3x" className="text-primary mb-3" />
              <h3>Create Groups</h3>
              <p>
                Create expense groups for trips, roommates, events, or any shared expenses.
                Invite your friends to join the group.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <FontAwesomeIcon icon={faMoneyBillWave} size="3x" className="text-primary mb-3" />
              <h3>Track Expenses</h3>
              <p>
                Add expenses to your groups and let the app track who paid what and who owes whom.
                No more confusion about shared expenses.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <FontAwesomeIcon icon={faCalculator} size="3x" className="text-primary mb-3" />
              <h3>Settle Up</h3>
              <p>
                Easily see balances, who owes what, and settle up with friends.
                Get detailed reports of all expenses and payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 