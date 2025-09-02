import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';

export function TestComponents() {
  return (
    <div className="p-8 space-y-4">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>VERSSAI Components Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button>Test Button</Button>
          <Input placeholder="Test input" />
          <Badge>Test Badge</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
