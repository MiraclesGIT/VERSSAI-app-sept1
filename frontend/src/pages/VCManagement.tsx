
import React from 'react';
import Header from '@/components/Header';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagement } from '@/components/company/UserManagement';
import { CompanySettings } from '@/components/company/CompanySettings';
import { NoCompanyState } from '@/components/company/NoCompanyState';
import { useCompany } from '@/contexts/CompanyContext';
import { Building, Users, Settings } from 'lucide-react';
import CompanyInfoEditor from '@/components/company/CompanyInfoEditor';
import QuickActionsPanel from '@/components/company/QuickActionsPanel';

const VCManagement = () => {
  const { company, userRole, loading, refreshCompany } = useCompany();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <TooltipProvider>
        <div className="px-4 py-6">
          <Header 
            title="VC Management" 
            subtitle="Set up your investment firm to get started"
          />
          <NoCompanyState />
        </div>
      </TooltipProvider>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <TooltipProvider>
      <div className="px-4 py-6">
        <Header 
          title="VC Management" 
          subtitle={`Manage ${company.name} settings and team`}
        />
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-verss-purple text-muted-foreground data-[state=active]:text-white">
              <Building className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-verss-purple text-muted-foreground data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-verss-purple text-muted-foreground data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Company Information Card */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CompanyInfoEditor
                      company={company}
                      onUpdate={refreshCompany}
                      isAdmin={isAdmin}
                    />
                    <div className="mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Your Role</p>
                        <p className="font-medium capitalize">{userRole}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Actions Card */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuickActionsPanel />
                  </CardContent>
                </Card>
              </div>
              
              {/* Support Card */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Support & Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Need Help?</p>
                        <p className="text-muted-foreground">Contact us at support@verss.ai</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Role Permissions</p>
                        <p className="text-muted-foreground">
                          {userRole === 'admin' 
                            ? 'Full access to manage users, settings, and all company data.' 
                            : userRole === 'member'
                            ? 'Access to view and manage startup data.'
                            : 'Read-only access to company data.'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Getting Started</p>
                        <p className="text-muted-foreground">Add your first startup or upload pitch decks to begin.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings">
            <CompanySettings />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default VCManagement;
