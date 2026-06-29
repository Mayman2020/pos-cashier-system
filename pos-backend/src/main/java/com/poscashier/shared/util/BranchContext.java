package com.poscashier.shared.util;

import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.exception.AppException;

public final class BranchContext {

    private BranchContext() {
    }

    public static Long resolveBranchId(Long requestedBranchId) {
        User user = SecurityUtils.getCurrentUser();
        if (SecurityUtils.hasRole(user, "ADMIN")) {
            if (requestedBranchId != null) {
                return requestedBranchId;
            }
            return user.getBranchId() != null ? user.getBranchId() : 1L;
        }
        if (user.getBranchId() == null) {
            throw AppException.forbidden("User has no branch assigned");
        }
        if (requestedBranchId != null && !requestedBranchId.equals(user.getBranchId())) {
            throw AppException.forbidden("Cannot access another branch");
        }
        return user.getBranchId();
    }

    public static void assertBranchAccess(Long branchId) {
        resolveBranchId(branchId);
    }
}
