
// Re-export all functions from the modular services
export {
  checkDomainRegistration,
  checkUserNeedsCompany
} from './company/domainValidationService';

export {
  getUserCompany,
  getUserRole
} from './company/companyQueryService';

export {
  createCompanyAndUser,
  updateCompany
} from './company/companyManagementService';

export {
  getCompanyUsers,
  removeUser,
  updateUserRole,
  addUserToCompany
} from './company/userManagementService';

export {
  checkUserExists
} from './company/userExistenceService';
