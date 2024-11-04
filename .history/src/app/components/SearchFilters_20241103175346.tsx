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
import { useMachine } from "@xstate/react";
import searchMachine from "../search.machine";

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
  const [state, send] = useMachine(searchMachine, {
    inspect: (inspectionEvent) => {
      // type: '@xstate.actor' or
      // type: '@xstate.snapshot' or
      // type: '@xstate.event'
      //   console.log(inspectionEvent);
      //   if (inspectionEvent.type === "@xstate.snapshot") {
      //     console.log(inspectionEvent);
      //     console.log(
      //       "SearchFilters - input",
      //       inspectionEvent.actorRef.options.input
      //     );
      //     console.log("SearchFilters - State id", inspectionEvent.actorRef.id);
      //   }
    },
  });
  console.log(state.value, state.context, "SearchFilters component");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // console.log(data.items);
    send({ type: "FILTER", filters: data.items });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="items"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Filtre</FormLabel>
                <FormDescription>Filtrer søgeresultatet.</FormDescription>
              </div>
              {items.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="items"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
