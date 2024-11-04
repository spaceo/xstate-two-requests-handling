"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import searchMachineActor from "../../machines/search.machine.actor";
import { useSelector } from "@xstate/react";

const items = [
  {
    id: "apple",
    label: "Æble",
  },
  {
    id: "horse",
    label: "Hest",
  },
  {
    id: "cannibal",
    label: "Kannibal",
  },
] as const;

const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
});

export default function SearchFilters() {
  const machineContext = useSelector(
    searchMachineActor,
    (snapshot) => snapshot.context
  );
  const selectedFilters = useSelector(
    searchMachineActor,
    (snapshot) => snapshot.context.selectedFilters
  );

  console.log({ selectedFilters });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    searchMachineActor.send({ type: "FILTER", filters: data.items });
  }
  //     searchMachineActor.send({ type: "FILTER", filters: data.items });

  return (
    <>
      <div className="min-h-700 mb-10">
        <pre>{JSON.stringify(machineContext, null, 2)}</pre>
      </div>
      <div>
        {items.map((item) => (
          <div key={item.id}>
            <div>
              <label
                htmlFor={item.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item.label}
              </label>
            </div>
            <Checkbox
              id={item.id}
              name="items"
              value={item.id}
              checked={selectedFilters.includes(item.id)}
              onClick={() => {
                console.log("clicked", item.id);
                searchMachineActor.send({
                  type: "TOGGLE_FILTER",
                  filter: item.id,
                });
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
